
# Use official Nginx base image
FROM nginx:latest

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy website files to container
# COPY ./html /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx when container launches
CMD ["nginx", "-g", "daemon off;"]