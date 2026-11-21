// Keep the source atlas and mip chain. Oblique roofs need anisotropic samples
// so the footprint does not span unrelated islands in the generated UV atlas.
export function configureBuildingTextureSampling(root, maximum = 1) {
  const anisotropy = Math.max(1, Math.min(16, Number.isFinite(maximum) ? Math.floor(maximum) : 1));
  const textures = new Set();
  root.traverse(object => {
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!material) continue;
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  for (const texture of textures) {
    if (texture.anisotropy !== anisotropy) {
      texture.anisotropy = anisotropy;
      texture.needsUpdate = true;
    }
  }
  return { textures: textures.size, anisotropy };
}
