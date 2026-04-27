const crypto = require('crypto');
const logger = require('./logger');

/**
 * Utility functions for content hashing and data integrity
 * Used for change detection in government schemes
 */

/**
 * Generate MD5 hash for given content
 * @param {*} content - Any JSON-serializable content
 * @returns {String} MD5 hash hex string
 */
function generateMD5Hash(content) {
  try {
    const stringified = JSON.stringify(content);
    return crypto
      .createHash('md5')
      .update(stringified)
      .digest('hex');
  } catch (error) {
    logger.error('Error generating MD5 hash', {
      error: error.message,
      contentType: typeof content,
    });

    return null;
  }
}

/**
 * Generate SHA256 hash for given content (more secure than MD5)
 * @param {*} content - Any JSON-serializable content
 * @returns {String} SHA256 hash hex string
 */
function generateSHA256Hash(content) {
  try {
    const stringified = JSON.stringify(content);
    return crypto
      .createHash('sha256')
      .update(stringified)
      .digest('hex');
  } catch (error) {
    logger.error('Error generating SHA256 hash', {
      error: error.message,
      contentType: typeof content,
    });

    return null;
  }
}

/**
 * Generate hash specifically for scheme content
 * Includes title, description, and link for change detection
 * @param {Object} scheme - Scheme object
 * @returns {String} Hash string
 */
function generateSchemeContentHash(scheme) {
  try {
    const contentToHash = {
      title: scheme.title || '',
      description: scheme.description || scheme.shortDescription || '',
      link: scheme.link || scheme.slug || '',
    };

    return generateMD5Hash(contentToHash);
  } catch (error) {
    logger.error('Error generating scheme content hash', {
      error: error.message,
      schemeTitle: scheme?.title || 'unknown',
    });

    return null;
  }
}

/**
 * Compare two hashes
 * @param {String} hash1 - First hash
 * @param {String} hash2 - Second hash
 * @returns {Boolean} true if hashes match
 */
function compareHashes(hash1, hash2) {
  if (!hash1 || !hash2) {
    return false;
  }

  return hash1.trim().toLowerCase() === hash2.trim().toLowerCase();
}

/**
 * Verify data integrity using hash
 * @param {*} data - Original data
 * @param {String} expectedHash - Expected hash value
 * @returns {Boolean} true if data matches expected hash
 */
function verifyDataIntegrity(data, expectedHash) {
  try {
    const calculatedHash = generateMD5Hash(data);
    return compareHashes(calculatedHash, expectedHash);
  } catch (error) {
    logger.error('Error verifying data integrity', {
      error: error.message,
    });

    return false;
  }
}

module.exports = {
  generateMD5Hash,
  generateSHA256Hash,
  generateSchemeContentHash,
  compareHashes,
  verifyDataIntegrity,
};
