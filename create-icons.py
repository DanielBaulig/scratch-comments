#!/usr/bin/env python3
"""
Simple script to create placeholder icons for the browser extension.
Creates three PNG files with Scratch's orange color (#FF6B00).
"""

import struct
import zlib

def create_png(width, height, color_rgb):
    """
    Create a simple PNG file with a solid color.

    Args:
        width: Image width in pixels
        height: Image height in pixels
        color_rgb: Tuple of (r, g, b) values (0-255)

    Returns:
        bytes: PNG file data
    """
    # PNG signature
    png_signature = b'\x89PNG\r\n\x1a\n'

    # IHDR chunk (image header)
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_chunk = create_chunk(b'IHDR', ihdr_data)

    # IDAT chunk (image data)
    raw_data = b''
    r, g, b = color_rgb
    for y in range(height):
        raw_data += b'\x00'  # Filter type for this scanline
        for x in range(width):
            raw_data += bytes([r, g, b])

    compressed_data = zlib.compress(raw_data, 9)
    idat_chunk = create_chunk(b'IDAT', compressed_data)

    # IEND chunk (image trailer)
    iend_chunk = create_chunk(b'IEND', b'')

    return png_signature + ihdr_chunk + idat_chunk + iend_chunk

def create_chunk(chunk_type, data):
    """Create a PNG chunk with type, data, and CRC."""
    length = struct.pack('>I', len(data))
    crc = zlib.crc32(chunk_type + data) & 0xffffffff
    crc_bytes = struct.pack('>I', crc)
    return length + chunk_type + data + crc_bytes

def main():
    # Scratch's orange color
    scratch_orange = (255, 107, 0)

    # Create icons
    sizes = [16, 48, 128]

    for size in sizes:
        png_data = create_png(size, size, scratch_orange)
        filename = f'icon{size}.png'

        with open(filename, 'wb') as f:
            f.write(png_data)

        print(f'Created {filename} ({size}x{size})')

if __name__ == '__main__':
    main()
