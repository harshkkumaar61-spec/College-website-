#!/usr/bin/env bash
# Exit on error
set -o errexit

# Packages install karo
pip install -r requirements.txt

# Static files collect karo (Admin panel ke liye)
python manage.py collectstatic --noinput

# Database migrate karo
python manage.py migrate