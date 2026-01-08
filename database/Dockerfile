FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_DB=productdb

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
