//create an image element
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
        image.src = url;
    });

export default async function getCroppedImage(imageSrc, pixelCrop) {
    if (!imageSrc || !pixelCrop) {
        throw new Error("Missing image source or crop area");
    }

    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx){return null;}

    const safeCrop = {
        x: Math.max(0, Math.floor(pixelCrop.x || 0)),
        y: Math.max(0, Math.floor(pixelCrop.y || 0)),
        width: Math.max(1, Math.floor(pixelCrop.width || 0)),
        height: Math.max(1, Math.floor(pixelCrop.height || 0)),
    };

    canvas.width = safeCrop.width;
    canvas.height = safeCrop.height;

    ctx.drawImage(
        image,
        safeCrop.x,
        safeCrop.y,
        safeCrop.width,
        safeCrop.height,
        0,
        0,
        safeCrop.width,
        safeCrop.height
    );

    // Convert canvas to a File object (Blob)
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            // wrap the blob in a File object so it looks like a normal upload to PHP
            const file = new File([blob], "cropped_car.jpg", { type: "image/jpeg" });
            resolve(file);
        }, 'image/jpeg', 0.95);
    });
}