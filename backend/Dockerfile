# Use an official PHP image with FPM. Adjust PHP version if needed.
FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libpq-dev \
    # For MySQL
    && docker-php-ext-install pdo_mysql \
    # Common extensions
    && docker-php-ext-install mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy existing application directory contents
COPY . .

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www/html

# Install dependencies
RUN composer install --optimize-autoloader --no-dev --no-interaction --no-plugins --no-scripts

# Clear caches and generate key (optional here, can be done on first run)
# RUN php artisan config:cache
# RUN php artisan route:cache
# RUN php artisan view:cache
# RUN php artisan key:generate --force # Ensure APP_KEY is set in .env for production

# Change current user to www-data
USER www-data

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["php-fpm"]