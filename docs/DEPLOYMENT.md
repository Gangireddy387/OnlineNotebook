# Deployment Guide - Online Notebook

This guide covers deployment options for the Online Notebook application.

## Pre-Deployment Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong database password
- [ ] Set NODE_ENV=production
- [ ] Test all features locally
- [ ] Review security settings
- [ ] Update admin password
- [ ] Configure CORS for production domain
- [ ] Set up SSL certificate

## Local Production Build

### 1. Build Frontend

```bash
cd client
npm run build
cd ..
```

This creates a `client/dist` folder with optimized production files.

### 2. Update Environment Variables

Create production `.env`:

```env
DB_HOST=your_production_host
DB_USER=your_db_user
DB_PASSWORD=strong_password_here
DB_NAME=online_notebook
DB_PORT=5432

JWT_SECRET=very_long_random_secret_key_here
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=production
```

### 3. Start Production Server

```bash
npm start
```

Access at: http://localhost:5000

## Deployment Options

### Option 1: Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Create Heroku App**
```bash
heroku create your-app-name
```

3. **Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production
```

5. **Deploy**
```bash
git push heroku main
```

6. **Run Setup Scripts**
```bash
heroku run node scripts/createAdmin.js
heroku run node scripts/seedData.js
```

### Option 2: DigitalOcean Droplet

1. **Create Droplet** (Ubuntu 20.04)

2. **SSH into Server**
```bash
ssh root@your_server_ip
```

3. **Install Dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install PM2
npm install -g pm2
```

4. **Setup PostgreSQL**
```bash
sudo -u postgres psql
CREATE DATABASE online_notebook;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE online_notebook TO your_user;
\q
```

5. **Clone and Setup Application**
```bash
cd /var/www
git clone your_repo_url online-notebook
cd online-notebook
npm install
cd client
npm install
npm run build
cd ..
```

6. **Configure Environment**
```bash
nano .env
# Add production environment variables
```

7. **Start with PM2**
```bash
pm2 start server.js --name online-notebook
pm2 save
pm2 startup
```

8. **Setup Nginx**
```bash
apt install -y nginx

nano /etc/nginx/sites-available/online-notebook
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/online-notebook /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

9. **Setup SSL (Certbot)**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your_domain.com
```

### Option 3: AWS EC2

1. **Launch EC2 Instance** (Ubuntu)

2. **Configure Security Group**
- SSH (22)
- HTTP (80)
- HTTPS (443)
- PostgreSQL (5432) - Only from app security group

3. **Follow DigitalOcean steps** above for setup

4. **Use RDS for Database** (Recommended)
- Create PostgreSQL RDS instance
- Update DB_HOST in .env

### Option 4: Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

WORKDIR /app/client
RUN npm install
RUN npm run build

WORKDIR /app

EXPOSE 5000

CMD ["npm", "start"]
```

2. **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=db
      - DB_USER=postgres
      - DB_PASSWORD=password
      - DB_NAME=online_notebook
      - JWT_SECRET=your_secret
      - NODE_ENV=production
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:13-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=online_notebook
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

3. **Deploy**
```bash
docker-compose up -d
docker-compose exec app node scripts/createAdmin.js
docker-compose exec app node scripts/seedData.js
```

## Post-Deployment Steps

### 1. Verify Deployment
- [ ] Access application URL
- [ ] Test login functionality
- [ ] Upload a test file
- [ ] Test download
- [ ] Test comments
- [ ] Check admin dashboard

### 2. Create Admin User
```bash
# SSH into server or run in container
node scripts/createAdmin.js
```

### 3. Seed Initial Data
```bash
node scripts/seedData.js
```

### 4. Monitor Application

Using PM2:
```bash
pm2 status
pm2 logs online-notebook
pm2 monit
```

### 5. Setup Backup

PostgreSQL backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgres"
mkdir -p $BACKUP_DIR

pg_dump -U postgres online_notebook > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup_script.sh
```

## Monitoring & Maintenance

### Application Logs
```bash
# PM2 logs
pm2 logs online-notebook

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Database Monitoring
```bash
sudo -u postgres psql online_notebook

# Check database size
SELECT pg_size_pretty(pg_database_size('online_notebook'));

# Active connections
SELECT count(*) FROM pg_stat_activity;
```

### Server Resources
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Network
netstat -tuln
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Session management with Redis
- Shared file storage (S3, DigitalOcean Spaces)

### Vertical Scaling
- Increase server resources
- Optimize PostgreSQL settings
- Enable caching (Redis)

### Database Optimization
- Add database indexes
- Enable query caching
- Use read replicas

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Change default passwords
- [ ] Enable firewall (UFW)
- [ ] Regular security updates
- [ ] Setup fail2ban
- [ ] Use environment variables
- [ ] Enable database encryption
- [ ] Setup rate limiting
- [ ] Regular backups
- [ ] Monitor logs

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs online-notebook

# Verify database connection
psql -U your_user -d online_notebook -h localhost

# Check port availability
netstat -tuln | grep 5000
```

### File Upload Issues
```bash
# Check uploads directory permissions
chmod 755 uploads
chown -R www-data:www-data uploads
```

### Database Connection Error
```bash
# Check PostgreSQL status
systemctl status postgresql

# Verify connection
psql -U your_user -d online_notebook
```

## Rollback Procedure

1. **Stop Application**
```bash
pm2 stop online-notebook
```

2. **Restore Database Backup**
```bash
psql -U postgres online_notebook < backup_file.sql
```

3. **Revert Code**
```bash
git checkout previous_commit
npm install
cd client && npm install && npm run build
```

4. **Restart Application**
```bash
pm2 restart online-notebook
```

## Support

For deployment issues:
1. Check server logs
2. Verify environment variables
3. Test database connectivity
4. Review Nginx configuration
5. Check firewall rules

---

**Remember**: Always test in staging before deploying to production!

