export function formatQuantity(quantity?: number, unit?: string) {
  if (!quantity || !unit) {
    return null;
  }

  if (unit === 'unit') {
    return quantity;
  }

  if (unit === 'liter') {
    if (quantity < 1) {
      return `${quantity * 1000}mL`;
    }

    return `${quantity}L`;
  }

  if (unit === 'gram') {
    if (quantity >= 1000) {
      return `${quantity / 1000}Kg`;
    }

    return `${quantity}g`;
  }

  return `${quantity}${unit}`;
}

export function formatLabel(quantity?: number, label?: string, labelPlural?: string) {
  if (!quantity || !label) {
    return null;
  }

  if (quantity > 1 && labelPlural) {
    return labelPlural;
  }

  return label;
}
