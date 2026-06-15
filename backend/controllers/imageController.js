const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const saveBuffer = (buffer, ext) => {
    const filename = `product-${Date.now()}${ext}`;
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    return `/uploads/${filename}`;
};

const extFromContentType = (contentType) => {
    if (contentType.includes('png')) return '.png';
    if (contentType.includes('webp')) return '.webp';
    if (contentType.includes('gif')) return '.gif';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
    return '.jpg';
};

// @desc    Download image from URL and save locally (Bing/Google links often fail — use upload instead)
// @route   POST /api/products/import-image-url
const importImageFromUrl = async (req, res) => {
    const { url } = req.body;

    if (!url || !url.trim()) {
        return res.status(400).json({ success: false, message: 'Image URL is required' });
    }

    try {
        const response = await fetch(url.trim(), {
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                Accept: 'image/*,*/*;q=0.8'
            }
        });

        if (!response.ok) {
            return res.status(400).json({
                success: false,
                message: 'Could not download from this link. Upload an image file from your PC instead.'
            });
        }

        const contentType = (response.headers.get('content-type') || '').toLowerCase();
        const buffer = Buffer.from(await response.arrayBuffer());

        if (!contentType.startsWith('image/') || buffer.length < 100) {
            return res.status(400).json({
                success: false,
                message: 'This link is not a direct image. Upload from PC, or right-click the image → Copy image address, then paste that URL.'
            });
        }

        if (buffer.length > 5 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: 'Image is too large (max 5MB)' });
        }

        const imageUrl = saveBuffer(buffer, extFromContentType(contentType));
        res.json({ success: true, data: { imageUrl } });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Could not import image. Use "Upload from PC" or copy the direct image address (not a Bing/Google page link).'
        });
    }
};

// @desc    Save base64 image data to uploads folder
// @route   POST /api/products/save-image-data
const saveImageData = async (req, res) => {
    const { imageData } = req.body;

    if (!imageData || !imageData.startsWith('data:image/')) {
        return res.status(400).json({ success: false, message: 'Invalid image data' });
    }

    try {
        const match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!match) {
            return res.status(400).json({ success: false, message: 'Invalid image format' });
        }

        const ext = match[1] === 'jpeg' ? '.jpg' : `.${match[1]}`;
        const buffer = Buffer.from(match[2], 'base64');

        if (buffer.length > 5 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: 'Image is too large (max 5MB)' });
        }

        const imageUrl = saveBuffer(buffer, ext);
        res.json({ success: true, data: { imageUrl } });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to save image' });
    }
};

module.exports = {
    importImageFromUrl,
    saveImageData
};
