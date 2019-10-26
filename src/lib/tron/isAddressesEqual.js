export default function isAddressesEqual(tw, xAddress, yAddress) {
  return tw.address.toHex(xAddress) === tw.address.toHex(yAddress);
}
