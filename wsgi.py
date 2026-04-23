import sys
import os

# Add your project directory to the path
path = '/home/salmanml277-stack/himasha-shavindi'
if path not in sys.path:
    sys.path.append(path)

from app import app as application
