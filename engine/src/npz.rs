//! A minimal `.npz` writer: NumPy `.npy` (format 1.0) arrays in an
//! uncompressed ZIP archive, readable by `numpy.load`. Used by
//! `ember encode` to dump observations for the Python checks; no
//! dependencies.

use std::io::Write;

/// Element types an array can hold.
pub trait NpyElem: Copy {
    /// NumPy `descr` (little endian).
    const DESCR: &'static str;
    fn put(self, out: &mut Vec<u8>);
}

macro_rules! elem {
    ($t:ty, $d:expr) => {
        impl NpyElem for $t {
            const DESCR: &'static str = $d;
            #[inline]
            fn put(self, out: &mut Vec<u8>) {
                out.extend_from_slice(&self.to_le_bytes());
            }
        }
    };
}
elem!(f32, "<f4");
elem!(f64, "<f8");
elem!(i8, "|i1");
elem!(u8, "|u1");
elem!(i16, "<i2");
elem!(i32, "<i4");
elem!(i64, "<i8");

impl NpyElem for bool {
    const DESCR: &'static str = "|b1";
    #[inline]
    fn put(self, out: &mut Vec<u8>) {
        out.push(self as u8);
    }
}

/// One `.npy` file: header and data.
pub fn npy_bytes<T: NpyElem>(shape: &[usize], data: &[T]) -> Vec<u8> {
    let n: usize = shape.iter().product();
    assert_eq!(n, data.len(), "npy: shape {shape:?} does not match {} elements", data.len());
    let dims: Vec<String> = shape.iter().map(|d| d.to_string()).collect();
    let shape_txt = match dims.len() {
        0 => "()".to_string(),
        1 => format!("({},)", dims[0]),
        _ => format!("({})", dims.join(", ")),
    };
    let mut header = format!("{{'descr': '{}', 'fortran_order': False, 'shape': {}, }}", T::DESCR, shape_txt);
    // magic (6) + version (2) + length (2) + header, padded to 64 with '\n' last
    let total = 10 + header.len() + 1;
    let pad = (64 - total % 64) % 64;
    header.push_str(&" ".repeat(pad));
    header.push('\n');
    let mut out = Vec::with_capacity(10 + header.len() + n * 4);
    out.extend_from_slice(b"\x93NUMPY\x01\x00");
    out.extend_from_slice(&(header.len() as u16).to_le_bytes());
    out.extend_from_slice(header.as_bytes());
    for &v in data {
        v.put(&mut out);
    }
    out
}

fn crc32(data: &[u8]) -> u32 {
    static TABLE: std::sync::OnceLock<[u32; 256]> = std::sync::OnceLock::new();
    let table = TABLE.get_or_init(|| {
        let mut t = [0u32; 256];
        for (i, e) in t.iter_mut().enumerate() {
            let mut c = i as u32;
            for _ in 0..8 {
                c = if c & 1 != 0 { 0xEDB8_8320 ^ (c >> 1) } else { c >> 1 };
            }
            *e = c;
        }
        t
    });
    let mut c = 0xFFFF_FFFFu32;
    for &b in data {
        c = table[((c ^ b as u32) & 0xFF) as usize] ^ (c >> 8);
    }
    c ^ 0xFFFF_FFFF
}

/// An `.npz` archive being built in memory (stored, no compression; ZIP64
/// is not supported, so each array and the whole file stay below 4 GiB).
#[derive(Default)]
pub struct Npz {
    data: Vec<u8>,
    central: Vec<u8>,
    entries: u16,
}

impl Npz {
    pub fn new() -> Npz {
        Npz::default()
    }

    /// Add array `name` (stored as `name.npy`).
    pub fn add<T: NpyElem>(&mut self, name: &str, shape: &[usize], data: &[T]) {
        let body = npy_bytes(shape, data);
        let fname = format!("{name}.npy");
        assert!(body.len() < u32::MAX as usize && self.data.len() < u32::MAX as usize, "npz: no ZIP64 support");
        let crc = crc32(&body);
        let offset = self.data.len() as u32;
        let size = body.len() as u32;
        let local = |out: &mut Vec<u8>| {
            out.extend_from_slice(&0x0403_4b50u32.to_le_bytes());
            out.extend_from_slice(&20u16.to_le_bytes()); // version needed
            out.extend_from_slice(&0u16.to_le_bytes()); // flags
            out.extend_from_slice(&0u16.to_le_bytes()); // stored
            out.extend_from_slice(&0u16.to_le_bytes()); // time
            out.extend_from_slice(&0x21u16.to_le_bytes()); // date (1980-01-01)
            out.extend_from_slice(&crc.to_le_bytes());
            out.extend_from_slice(&size.to_le_bytes());
            out.extend_from_slice(&size.to_le_bytes());
            out.extend_from_slice(&(fname.len() as u16).to_le_bytes());
            out.extend_from_slice(&0u16.to_le_bytes()); // extra
        };
        local(&mut self.data);
        self.data.extend_from_slice(fname.as_bytes());
        self.data.extend_from_slice(&body);
        let c = &mut self.central;
        c.extend_from_slice(&0x0201_4b50u32.to_le_bytes());
        c.extend_from_slice(&20u16.to_le_bytes()); // made by
        c.extend_from_slice(&20u16.to_le_bytes()); // needed
        c.extend_from_slice(&0u16.to_le_bytes());
        c.extend_from_slice(&0u16.to_le_bytes());
        c.extend_from_slice(&0u16.to_le_bytes());
        c.extend_from_slice(&0x21u16.to_le_bytes());
        c.extend_from_slice(&crc.to_le_bytes());
        c.extend_from_slice(&size.to_le_bytes());
        c.extend_from_slice(&size.to_le_bytes());
        c.extend_from_slice(&(fname.len() as u16).to_le_bytes());
        c.extend_from_slice(&0u16.to_le_bytes()); // extra
        c.extend_from_slice(&0u16.to_le_bytes()); // comment
        c.extend_from_slice(&0u16.to_le_bytes()); // disk
        c.extend_from_slice(&0u16.to_le_bytes()); // internal attributes
        c.extend_from_slice(&0u32.to_le_bytes()); // external attributes
        c.extend_from_slice(&offset.to_le_bytes());
        c.extend_from_slice(fname.as_bytes());
        self.entries += 1;
    }

    /// The archive's bytes.
    pub fn finish(mut self) -> Vec<u8> {
        let cd_offset = self.data.len() as u32;
        let cd_size = self.central.len() as u32;
        self.data.extend_from_slice(&self.central);
        let d = &mut self.data;
        d.extend_from_slice(&0x0605_4b50u32.to_le_bytes());
        d.extend_from_slice(&0u16.to_le_bytes());
        d.extend_from_slice(&0u16.to_le_bytes());
        d.extend_from_slice(&self.entries.to_le_bytes());
        d.extend_from_slice(&self.entries.to_le_bytes());
        d.extend_from_slice(&cd_size.to_le_bytes());
        d.extend_from_slice(&cd_offset.to_le_bytes());
        d.extend_from_slice(&0u16.to_le_bytes());
        self.data
    }

    pub fn write(self, path: &std::path::Path) -> std::io::Result<()> {
        let bytes = self.finish();
        let mut f = std::fs::File::create(path)?;
        f.write_all(&bytes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn crc_known_value() {
        assert_eq!(crc32(b"123456789"), 0xCBF4_3926);
    }

    #[test]
    fn header_is_aligned() {
        let b = npy_bytes(&[2, 3], &[1.0f32; 6]);
        let hlen = u16::from_le_bytes([b[8], b[9]]) as usize;
        assert_eq!((10 + hlen) % 64, 0);
        assert_eq!(b[10 + hlen - 1], b'\n');
        assert_eq!(b.len(), 10 + hlen + 24);
    }
}
