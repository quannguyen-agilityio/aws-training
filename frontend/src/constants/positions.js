export function getPositionAbbr(pos) {
  switch (pos) {
    case 'PG':
      return 'PG';
    case 'SG':
      return 'SG';
    case 'SF':
      return 'SF';
    case 'PF':
      return 'PF';
    case 'C':
      return 'C';
    default:
      return pos || 'PL';
  }
}
