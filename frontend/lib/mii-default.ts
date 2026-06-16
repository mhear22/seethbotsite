/**
 * Default Mii Store Data for MaWLd.
 * 
 * Valid 96-byte Wii U FFLStoreData (FFSD format):
 * - 0x5C bytes of Mii data
 * - 2 bytes padding (0x0000)
 * - 2 bytes CRC-16 (CCITT, polynomial 0x1021)
 *
 * Generated from the Mii Encoder with these properties:
 * - Name: MaWLd | Creator: Oracle
 * - Gender: Male | Birthday: June 15
 * - Tall (85/127), very skinny (20/127)
 * - Purple favorite color, purple hair, purple eyebrows
 * - Pale skin, tall pointed-chin face
 * - Short messy hair (type 17), yellow eyes
 * - Small reptilian eyes, thick angled eyebrows, small downturned mouth
 * - No facial hair, glasses, or mole
 *
 * CRC-16 verified over bytes 0x00-0x5D.
 */
export const DEFAULT_MII_DATA = 'AwAAQDhBoEEAAISg27iHMb5gKwAAACoq7CFNAGEAVwBMAGQAAAAAAAAAAAAAAFUUFQARBulkZBjGRUIYQQwERAkAAAAAAAAATwByAGEAYwBsAGUAAAAAAAAAAAAAAOHU'
