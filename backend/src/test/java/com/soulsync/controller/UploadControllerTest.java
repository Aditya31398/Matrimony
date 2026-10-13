package com.soulsync.controller;

import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class UploadControllerTest {

    private static byte[] jpeg(int w, int h) throws IOException {
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        // Noise so the encoder can't compress it to almost nothing
        for (int y = 0; y < h; y += 4) for (int x = 0; x < w; x += 4) img.setRGB(x, y, (x * 31 + y * 17) * 0x010101);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "jpg", out);
        return out.toByteArray();
    }

    @Test
    void largePhotoIsShrunkToMaxDimension() throws IOException {
        byte[] original = jpeg(3000, 2000);
        assertTrue(UploadController.needsShrinking(original, "image/jpeg"));
        BufferedImage result = ImageIO.read(new ByteArrayInputStream(UploadController.shrink(original)));
        assertEquals(1400, result.getWidth());
        assertEquals(933, result.getHeight(), 1);
    }

    @Test
    void smallPhotoIsKeptAsIs() throws IOException {
        byte[] small = jpeg(800, 600);
        assertTrue(small.length < 400 * 1024);
        assertFalse(UploadController.needsShrinking(small, "image/jpeg"));
    }

    @Test
    void webpIsNeverReencoded() {
        assertFalse(UploadController.needsShrinking(new byte[500_000], "image/webp"));
    }
}
