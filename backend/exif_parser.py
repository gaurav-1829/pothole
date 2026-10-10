from PIL import Image, ExifTags
from typing import Optional, Dict, Any, Tuple
import datetime


def _convert_to_degrees(value) -> Optional[float]:
    """Helper to convert the GPS coordinates stored in EXIF to decimal degrees."""
    try:
        # Check if value is a tuple of rational values or floats
        d0 = float(value[0])
        d1 = float(value[1])
        d2 = float(value[2])
        return d0 + (d1 / 60.0) + (d2 / 3600.0)
    except Exception:
        return None


def extract_exif_metadata(image_path: str) -> Dict[str, Any]:
    """
    Extracts EXIF metadata from an image, including GPS latitude & longitude,
    camera details, and capture timestamp.
    """
    metadata = {
        "has_gps": False,
        "latitude": None,
        "longitude": None,
        "captured_at": None,
        "camera_make": None,
        "camera_model": None,
        "orientation": 1,
    }

    try:
        with Image.open(image_path) as img:
            exif_raw = img._getexif()
            if not exif_raw:
                return metadata

            # Map raw tag IDs to string names
            exif = {}
            for tag_id, value in exif_raw.items():
                tag_name = ExifTags.TAGS.get(tag_id, tag_id)
                exif[tag_name] = value

            # Extract camera & timestamp
            metadata["camera_make"] = exif.get("Make")
            metadata["camera_model"] = exif.get("Model")
            metadata["orientation"] = exif.get("Orientation", 1)

            date_str = exif.get("DateTimeOriginal") or exif.get("DateTime")
            if date_str:
                try:
                    metadata["captured_at"] = datetime.datetime.strptime(
                        str(date_str), "%Y:%m:%d %H:%M:%S"
                    ).isoformat()
                except Exception:
                    metadata["captured_at"] = str(date_str)

            # Extract GPS info
            gps_info = exif.get("GPSInfo")
            if gps_info:
                gps_tags = {}
                for key, val in gps_info.items():
                    sub_tag = ExifTags.GPSTAGS.get(key, key)
                    gps_tags[sub_tag] = val

                lat_val = gps_tags.get("GPSLatitude")
                lat_ref = gps_tags.get("GPSLatitudeRef", "N")
                lng_val = gps_tags.get("GPSLongitude")
                lng_ref = gps_tags.get("GPSLongitudeRef", "E")

                if lat_val and lng_val:
                    lat = _convert_to_degrees(lat_val)
                    lng = _convert_to_degrees(lng_val)

                    if lat is not None and lng is not None:
                        if lat_ref != "N":
                            lat = -lat
                        if lng_ref != "E":
                            lng = -lng

                        metadata["has_gps"] = True
                        metadata["latitude"] = round(lat, 6)
                        metadata["longitude"] = round(lng, 6)

    except Exception as e:
        print(f"[EXIF Parser] Warning extracting EXIF: {e}")

    return metadata
