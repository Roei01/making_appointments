const bcrypt = require('bcrypt');

async function generateHash(password) {
  const saltRounds = 10; // מספר הסבבים להוספת salt
  const hash = await bcrypt.hash(password, saltRounds); // יצירת ההצפנה
  console.log(`ההצפנה של הסיסמה היא: ${hash}`);
}

generateHash(''); // החלף '1234' בסיסמה שברצונך להצפין
