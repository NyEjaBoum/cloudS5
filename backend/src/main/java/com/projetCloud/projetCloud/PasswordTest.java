package com.projetCloud.projetCloud;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class PasswordTest {
    private static final String AES_KEY = "1234567890123456";
    private static final String AES_ALGO = "AES";

    public static String encryptPassword(String password) {
        try {
            SecretKeySpec key = new SecretKeySpec(AES_KEY.getBytes(), AES_ALGO);
            Cipher cipher = Cipher.getInstance(AES_ALGO);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encrypted = cipher.doFinal(password.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Erreur chiffrement mot de passe", e);
        }
    }

    public static String decryptPassword(String encryptedPassword) {
        try {
            SecretKeySpec key = new SecretKeySpec(AES_KEY.getBytes(), AES_ALGO);
            Cipher cipher = Cipher.getInstance(AES_ALGO);
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decoded = Base64.getDecoder().decode(encryptedPassword);
            byte[] decrypted = cipher.doFinal(decoded);
            return new String(decrypted);
        } catch (Exception e) {
            throw new RuntimeException("Erreur déchiffrement mot de passe", e);
        }
    }

    public static void main(String[] args) {
        String password = "user123";
        String encrypted = encryptPassword(password);
        String decrypted = decryptPassword(encrypted);
        System.out.println("Mot de passe original : " + password);
        System.out.println("Chiffré : " + encrypted);
        System.out.println("Déchiffré : " + decrypted);
    }
}