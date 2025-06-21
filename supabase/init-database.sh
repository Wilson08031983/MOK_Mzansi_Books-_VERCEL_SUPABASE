#!/bin/bash

# Initialize the Supabase database with our schema
echo "Initializing Supabase database..."

# Wait for Postgres to be ready
echo "Waiting for Postgres to be ready..."
sleep 10

# Execute SQL script using docker exec
docker exec mok_mzansi_books-_vercel_supabase-db-1 psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/init.sql

echo "Database initialization complete!"
