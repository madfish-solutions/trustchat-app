import { Buffer } from "buffer";

export default function getPubKeys(pkParts) {
  const pubKeys = [];

  let stash;
  let index = 0;
  for (const part of pkParts) {
    if (index % 2 === 0) {
      stash = part;
      index++;
      continue;
    }

    const pubKey = Buffer.from(
      stash.replace("0x", "") + part.replace("0x", ""),
      "hex"
    ).toString("base64");
    pubKeys.push(pubKey);

    index++;
  }

  return pubKeys;
}
