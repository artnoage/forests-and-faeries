"""Forests and Faeries backend: the catalogued encounters behind one Flask app.

WSGI entry point: ``gunicorn game.server:app`` (run with one worker: games live
in an in-memory store). Every combat rule, candidate list and timeline record is
computed in Rust by ``ember_rs.WebGame``.

Protections:

* static files only from an explicit allowlist (``PUBLIC_FILES``), the page at
  ``/``; models are served per figure key, textures and prop models by name;
  story files (``/story/<id>/...``) by one rule, ``game.assets.story_path``;
* the production security headers (strict CSP, frame and referrer policies,
  ``nosniff``, ``Permissions-Policy``) on every response;
* a session cookie that is HttpOnly, ``SameSite=Strict`` and ``Secure`` behind
  HTTPS (or with ``EMBER_SECURE_COOKIE=1``);
* mutations need a JSON object body (16 KiB at most), the ``X-CSRF-Token`` of
  the game (403 otherwise) and its exact current revision (409 when stale);
  unexpected fields are refused;
* an expired or evicted game answers 410 with ``code: expired`` (the client
  says so and starts a fresh game; it never retries silently);
* one store of at most ``CAPACITY`` games (``FF_CAPACITY`` overrides it) with a
  one-hour idle limit, and at most ``PER_CLIENT`` games per client address
  (``X-Real-IP`` from the loopback proxy), so one client cannot evict everybody
  else's games;
* errors are short JSON messages; an unexpected exception is logged and
  answered with a generic 500, never a traceback.

Private encounters (``encounters/private/``) are listed and playable only when
``FF_PRIVATE_ENCOUNTERS=1``. All sixteen figures are the project's own rigged
originals.
"""
from __future__ import annotations

from collections import OrderedDict
import ipaddress
import logging
import os
import secrets
import threading
import time

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.exceptions import HTTPException

from game.assets import (
    MODEL_FILES,
    MODEL_KEYS,
    PAGE_FILES,
    PROP_FILES,
    PUBLIC_FILES,
    ROOT,
    STATIC,
    STORY_TYPES,
    TEXTURE_FILES,
    story_path,
    audio_path,
    AUDIO_TYPES,
)

COOKIE = 'ff_game'
PER_CLIENT = 4
CAPACITY = 64
TTL = 3600
CSP = ("default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; "
       "media-src 'self' blob:; connect-src 'self' blob:; font-src 'self'; base-uri 'none'; form-action 'none'; "
       "frame-ancestors 'none'; object-src 'none'")
LOG = logging.getLogger('game.server')
_DEFAULT_APP = None


def env_flag(name):
    return os.environ.get(name, '') == '1'


class GameStore:
    """Games by session cookie: LRU, idle expiry, a per-client cap. All access
    happens under ``lock``."""

    def __init__(self, factory, capacity=CAPACITY, ttl=TTL, per_client=PER_CLIENT):
        self.factory = factory
        self.capacity = capacity
        self.ttl = ttl
        self.per_client = per_client
        self.games = OrderedDict()   # key -> (last_seen, client, game)
        self.lock = threading.RLock()

    def expire(self):
        now = time.monotonic()
        for key, (seen, _, _) in list(self.games.items()):
            if now - seen >= self.ttl:
                del self.games[key]

    def get(self, key):
        self.expire()
        if key not in self.games:
            return None
        _, client, game = self.games.pop(key)
        self.games[key] = (time.monotonic(), client, game)
        return game

    def put(self, key, client, game):
        self.games.pop(key, None)
        self.games[key] = (time.monotonic(), client, game)

    def delete(self, key):
        self.games.pop(key, None)

    def create(self, client, **options):
        self.expire()
        own = [key for key, (_, owner, _) in self.games.items() if owner == client]
        while len(own) >= self.per_client:
            del self.games[own.pop(0)]
        while len(self.games) >= self.capacity:
            self.games.popitem(last=False)
        key = secrets.token_urlsafe(32)
        game = self.factory(**options)
        self.games[key] = (time.monotonic(), client, game)
        return key, game


def client_address():
    """The client's address: the proxy's X-Real-IP when the request comes over
    loopback, else the peer."""
    peer = request.remote_addr or ''
    try:
        loopback = ipaddress.ip_address(peer).is_loopback
    except ValueError:
        loopback = False
    forwarded = request.headers.get('X-Real-IP', '').strip()
    if loopback and forwarded:
        try:
            return str(ipaddress.ip_address(forwarded))
        except ValueError:
            return peer
    return peer


def create_app():
    ui = os.environ.get('EMBER_UI', 'ff') or 'ff'
    if ui != 'ff':
        raise RuntimeError("EMBER_UI must be 'ff'.")

    from game import catalogue
    from game.arena import FFArena

    app = Flask(__name__, static_folder=None)
    app.config.update(MAX_CONTENT_LENGTH=16 * 1024, DEBUG=False, TESTING=False)
    private = env_flag('FF_PRIVATE_ENCOUNTERS')
    levels = catalogue.load(include_private=private)
    default = next(iter(levels.values()))

    def factory(level=default, seed=None, revision=0, csrf_token=None):
        return FFArena(level, seed=seed, revision=revision, csrf_token=csrf_token)

    raw = os.environ.get('FF_CAPACITY', '')
    if raw and not (raw.isdigit() and 1 <= int(raw) <= 256):
        raise RuntimeError('FF_CAPACITY must be a whole number from 1 to 256')
    store = GameStore(factory, capacity=int(raw) if raw else CAPACITY)
    app.extensions['ff_games'] = store
    app.config.update(FF_PRIVATE=private)

    @app.after_request
    def security(response):
        if request.path.startswith('/api/') or request.path in ('/', '/healthz') or response.status_code >= 400:
            response.headers['Cache-Control'] = 'no-store'
        else:
            response.headers['Cache-Control'] = 'no-cache'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Referrer-Policy'] = 'no-referrer'
        response.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'
        response.headers['Content-Security-Policy'] = CSP
        return response

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error=error.description), error.code

    @app.errorhandler(Exception)
    def internal_error(error):
        LOG.exception('unexpected error')
        return jsonify(error='Internal error; reconnect to continue.'), 500

    @app.get('/healthz')
    def health():
        return jsonify(status='ok', engine='ember-rs', ui='forests-and-faeries')

    def static_file(name):
        if name in MODEL_FILES:
            return send_from_directory(STATIC, name, mimetype='model/gltf-binary')
        return send_from_directory(STATIC, name)

    app.add_url_rule('/', 'index', lambda: static_file('index.html'), methods=['GET'])
    for name in PUBLIC_FILES:
        app.add_url_rule('/' + name, name, lambda name=name: static_file(name), methods=['GET'])

    @app.get('/story/<path:name>')
    def story_file(name):
        # One rule for every story directory (docs/STORY_MODE.md): allowlisted suffixes only,
        # no traversal or hidden files; Range requests work for audio and video seeking.
        path = story_path(name)
        if path is None:
            return jsonify(error='Not found.'), 404
        return send_from_directory(path.parent, path.name, mimetype=STORY_TYPES[path.suffix], conditional=True)

    @app.get('/audio/<path:name>')
    def audio_file(name):
        # Game sound (docs/SOUND.md): mp3 files and the manifest under static/audio/, one rule.
        path = audio_path(name)
        if path is None:
            return jsonify(error='Not found.'), 404
        return send_from_directory(path.parent, path.name, mimetype=AUDIO_TYPES[path.suffix], conditional=True)

    def wire(game, payload):
        return game.wire(payload)

    @app.get('/api/encounters')
    def encounters():
        return jsonify(encounters=catalogue.catalogue_view(include_private=private))

    @app.get('/api/state')
    def state():
        with store.lock:
            key = request.cookies.get(COOKIE)
            game = store.get(key) if key else None
            created = game is None
            try:
                if created:
                    key, game = store.create(client_address())
                response = jsonify(wire(game, game.state()))
            except Exception:
                if key:
                    store.delete(key)
                raise
            if created:
                response.set_cookie(COOKIE, key, httponly=True, samesite='Strict',
                                    secure=request.is_secure or os.environ.get('EMBER_SECURE_COOKIE') == '1',
                                    max_age=store.ttl, path='/')
            return response

    allowed = {'new': {'encounter', 'preset', 'seed', 'hero_level'}, 'action': {'revision', 'action_id'},
               'end-turn': {'revision'}, 'advance': {'revision', 'autoplay'},
               'setup': {'revision', 'placements', 'monster_control'}, 'start': {'revision'}}

    def mutation(operation):
        if request.mimetype != 'application/json':
            return jsonify(error='A JSON request body is required.'), 400
        try:
            data = request.get_json(silent=True)
        except RecursionError:
            return jsonify(error='JSON body is too deeply nested.'), 400
        if not isinstance(data, dict):
            return jsonify(error='JSON body must be an object.'), 400
        with store.lock:
            key = request.cookies.get(COOKIE)
            game = store.get(key) if key else None
            if game is None:
                return jsonify(error='This game has expired. A new one was started.', code='expired'), 410
            token = request.headers.get('X-CSRF-Token', '')
            try:
                token_bytes = token.encode('utf-8')
            except UnicodeEncodeError:
                return jsonify(error='Invalid CSRF token.'), 403
            if not secrets.compare_digest(token_bytes, game.csrf_token.encode('utf-8')):
                return jsonify(error='Invalid CSRF token.'), 403
            if set(data) - allowed[operation]:
                return jsonify(error='Unexpected request fields.'), 400
            if operation != 'new':
                if type(data.get('revision')) is not int:
                    return jsonify(error='revision must be an integer.'), 400
                if data['revision'] != game.revision:
                    return jsonify(error='The game moved on; showing its current state.', code='stale'), 409
            try:
                if operation == 'new':
                    seed = data.get('seed')
                    if 'seed' in data and (type(seed) is not int or not 0 <= seed <= 2**31 - 1):
                        raise ValueError('seed must be an integer from 0 to 2147483647.')
                    encounter = data.get('encounter', game.level.encounter_id)
                    preset = data.get('preset', game.level.preset_id if encounter == game.level.encounter_id else None)
                    if not isinstance(encounter, str) or not (preset is None or isinstance(preset, str)):
                        raise ValueError('encounter and preset must be strings.')
                    if preset is None:
                        preset = next((p for e, p in levels if e == encounter), None)
                    level = levels.get((encounter, preset))
                    if level is None:
                        raise ValueError('Unknown encounter or preset.')
                    if 'hero_level' in data:
                        level = level.with_hero_level(data['hero_level'])
                    game = factory(level=level, seed=seed, revision=game.revision + 1, csrf_token=game.csrf_token)
                    store.put(key, client_address(), game)
                    return jsonify(wire(game, game.state()))
                if operation == 'setup':
                    result = game.configure(data.get('placements'), data.get('monster_control'))
                elif operation == 'start':
                    result = game.start()
                elif operation == 'action':
                    action_id = data.get('action_id')
                    if not isinstance(action_id, str) or not 1 <= len(action_id) <= 100:
                        raise ValueError('action_id must be a short string.')
                    result = game.perform(action_id)
                elif operation == 'end-turn':
                    result = game.end_turn()
                else:
                    autoplay = data.get('autoplay', False)
                    if type(autoplay) is not bool:
                        raise ValueError('autoplay must be a boolean.')
                    result = game.advance(autoplay=autoplay)
                return jsonify(wire(game, result))
            except ValueError as error:
                return jsonify(error=str(error)), 400
            except Exception:
                store.delete(key)
                raise

    for operation in allowed:
        app.add_url_rule('/api/' + operation, 'api-' + operation,
                         lambda operation=operation: mutation(operation), methods=['POST'])
    return app


def __getattr__(name):
    global _DEFAULT_APP
    if name == 'app':
        if _DEFAULT_APP is None:
            _DEFAULT_APP = create_app()
        return _DEFAULT_APP
    raise AttributeError(f'module {__name__!r} has no attribute {name!r}')
