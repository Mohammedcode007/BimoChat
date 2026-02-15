import React from "react";
import ImageViewing from "react-native-image-viewing";

export default function Lightbox({
  visible,
  images,
  onClose
}: any) {

  return (
    <ImageViewing
      images={images.map((img: any) => ({ uri: img.url }))}
      imageIndex={0}
      visible={visible}
      onRequestClose={onClose}
    />
  );
}
