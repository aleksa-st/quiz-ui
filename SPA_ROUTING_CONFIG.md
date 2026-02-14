# SPA Routing Configuration

This directory contains configuration files to fix the 403 Forbidden error that occurs when reloading the page with query parameters.

## Problem
Single Page Applications (SPAs) with hash routing handle navigation on the client side. When you reload the page at a URL like `/?quizId=11#discovery`, the server tries to find a file at `/?quizId=11` and returns 403 Forbidden because it doesn't exist.

## Solution
Configure your server to always serve `index.html` for all requests, allowing the React app to handle routing.

## Apache (.htaccess)

If your server uses Apache, copy `.htaccess` to your production `dist` folder:

```bash
# In your production environment
cp .htaccess dist/.htaccess
```

The `.htaccess` file contains:
- Rewrite rules to serve `index.html` for all non-file requests
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

## Nginx

If your server uses Nginx, add the configuration from `nginx.conf.example` to your server block:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This tells nginx to:
1. Try to serve the requested file (`$uri`)
2. Try to serve it as a directory (`$uri/`)
3. Fall back to `index.html` if neither exists

## Deployment Steps

### For Apache:
1. Build the frontend: `npm run build`
2. Copy `.htaccess` to the `dist` folder: `cp .htaccess dist/`
3. Upload the entire `dist` folder to your production server
4. Ensure `mod_rewrite` is enabled: `a2enmod rewrite`

### For Nginx:
1. Build the frontend: `npm run build`
2. Update your nginx configuration with the rules from `nginx.conf.example`
3. Test the configuration: `nginx -t`
4. Reload nginx: `nginx -s reload`
5. Upload the `dist` folder to your production server

## Verification
After deploying:
1. Navigate to `https://kalamschool.org/#discovery`
2. Reload the page (F5)
3. You should see the app load correctly instead of a 403 error

## Additional Notes
- The hash routing (`#discovery`, `#dashboard`, etc.) is client-side only and doesn't require server configuration
- Query parameters (`?quizId=11`) are part of the server request and need the rewrite rules
- Both `.htaccess` and nginx configs include caching rules for static assets
