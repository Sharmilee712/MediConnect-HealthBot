# 1. Use the latest stable Node.js LTS version
FROM node:20-slim

# 2. Install Chromium and system libraries required for Puppeteer
# These libraries are essential for rendering the WhatsApp Web page in a headless environment.
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    libnss3 \
    libatk1.0-0 \
    libasound2 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 3. Set Environment Variables for Puppeteer
# This tells the 'whatsapp-web.js' library to use the installed Chromium
# instead of trying to download its own (which often fails in Docker).
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 4. Set the working directory inside the container
WORKDIR /usr/src/app

# 5. Copy package files first to leverage Docker's layer caching
COPY app/package*.json ./

# 6. Install Node dependencies
RUN npm install

# 7. Copy the rest of your application code
COPY app/ .

# 8. Start the bot
CMD [ "node", "app.js" ]