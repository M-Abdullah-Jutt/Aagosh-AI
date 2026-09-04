/**
 * Utility function to calculate human-friendly age from date of birth.
 * Matches backend age calculation logic.
 */
export const calculateAge = (dobString) => {
  if (!dobString) return '';
  const dob = new Date(dobString);
  const today = new Date();

  if (isNaN(dob.getTime()) || dob > today) {
    return 'Newborn';
  }

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years === 0) {
    if (months === 0) return 'Newborn';
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }

  const yearStr = `${years} ${years === 1 ? 'year' : 'years'}`;
  if (months > 0) {
    const monthStr = `${months} ${months === 1 ? 'month' : 'months'}`;
    return `${yearStr}, ${monthStr}`;
  }

  return yearStr;
};

export default calculateAge;
