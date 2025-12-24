#!/bin/bash
# VPS Setup Script for Building Management App
# Run as root on Ubuntu 24.04 LTS

set -e

echo "========================================="
echo "Building App - VPS Setup Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - CHANGE THESE!
DB_NAME="building_app"
DB_USER="building_app_user"
read -sp "Enter password for database user '$DB_USER': " DB_PASSWORD
echo

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: Password cannot be empty${NC}"
    exit 1
fi

echo -e "${GREEN}Starting setup...${NC}"

# 1. Update system
echo -e "${YELLOW}[1/7] Updating system packages...${NC}"
apt update && apt upgrade -y

# 2. Install PostgreSQL 16
echo -e "${YELLOW}[2/7] Installing PostgreSQL 16...${NC}"
apt install -y postgresql postgresql-contrib

# Verify installation
PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)
echo -e "${GREEN}PostgreSQL $PG_VERSION installed${NC}"

# 3. Configure PostgreSQL
echo -e "${YELLOW}[3/7] Configuring PostgreSQL...${NC}"

# Find the PostgreSQL config directory
PG_CONF_DIR="/etc/postgresql/$PG_VERSION/main"

# Enable remote connections
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF_DIR/postgresql.conf"

# Enable SSL
sed -i "s/#ssl = on/ssl = on/" "$PG_CONF_DIR/postgresql.conf"

# 4. Create database and user
echo -e "${YELLOW}[4/7] Creating database and user...${NC}"

sudo -u postgres psql <<EOF
-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to the database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
EOF

echo -e "${GREEN}Database '$DB_NAME' and user '$DB_USER' created${NC}"

# 5. Configure pg_hba.conf for remote SSL connections
echo -e "${YELLOW}[5/7] Configuring remote access...${NC}"

# Backup original
cp "$PG_CONF_DIR/pg_hba.conf" "$PG_CONF_DIR/pg_hba.conf.backup"

# Add SSL connection rules (append before the last line)
cat >> "$PG_CONF_DIR/pg_hba.conf" <<EOF

# Allow SSL connections from anywhere (for Vercel deployment)
hostssl $DB_NAME $DB_USER 0.0.0.0/0 scram-sha-256
hostssl $DB_NAME $DB_USER ::/0 scram-sha-256
EOF

# 6. Configure firewall
echo -e "${YELLOW}[6/7] Configuring firewall...${NC}"

# Install UFW if not present
apt install -y ufw

# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 5432/tcp  # PostgreSQL

# Enable UFW (will prompt)
echo "y" | ufw enable

echo -e "${GREEN}Firewall configured${NC}"

# 7. Restart PostgreSQL
echo -e "${YELLOW}[7/7] Restarting PostgreSQL...${NC}"
systemctl restart postgresql
systemctl enable postgresql

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo "========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Database connection details:"
echo "  Host: $SERVER_IP"
echo "  Port: 5432"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: (the one you entered)"
echo "  SSL: Required"
echo ""
echo "Connection string for Vercel:"
echo -e "${YELLOW}postgresql://$DB_USER:YOUR_PASSWORD@$SERVER_IP:5432/$DB_NAME?sslmode=require${NC}"
echo ""
echo "Next steps:"
echo "  1. Run the schema script: 02-schema.sql"
echo "  2. Update your Vercel environment variables"
echo "  3. Deploy your updated code"
echo ""
echo "To connect manually:"
echo "  psql \"postgresql://$DB_USER@$SERVER_IP:5432/$DB_NAME?sslmode=require\""
echo ""
