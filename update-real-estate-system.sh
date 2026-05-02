#!/bin/bash
cd /portfolio/Real-Estate-Lead-Capture-System || {
        echo "Unable to change directories."
        exit 1
}

sudo git pull origin master || {
        echo "Unable to pull latest update."
        exit 1
}

sudo docker-compose down || {
        echo "Unable to stop body shop system container."
        exit 1
}

cd /portfolio/Real-Estate-Lead-Capture-System/frontend || {
        echo "Unable to change directories."
        exit 1
}

npm run build || {
        echo "Build attempt failed."
        exit 1
}

sudo mv dist build || {
        echo "Rename failed."
        exit 1
}

rm -rf /portfolio/Real-Estate-Lead-Capture-System/backend/build || {
        echo "Unable to delete build folder."
        exit 1
}

mv build /portfolio/Real-Estate-Lead-Capture-System/backend || {
        echo "Unable to overwrite build folder."
        exit 1
}

cd /portfolio/Real-Estate-Lead-Capture-System || {
        echo "Unable to change directories."
        exit 1
}

sudo docker-compose up --build -d || {
        echo "Unable to build and start body shop system container."
        exit 1
}

echo "The body shop system frontend was rebuilt. The Docker container was started and is successfully serving the body shop system!"
exit 1
