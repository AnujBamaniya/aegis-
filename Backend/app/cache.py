import os
from diskcache import Cache
from dotenv import load_dotenv

load_dotenv()
cache_dir = os.getenv("CACHE_DIR", "./data/cache")
cache = Cache(cache_dir)
