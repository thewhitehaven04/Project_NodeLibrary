const { DateTime } = require('luxon');
const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

AuthorSchema.virtual('name').get(function () {
  let fullName = '';
  if (this.first_name && this.family_name) {
    return this.first_name + ' ' + this.family_name;
  }
  return fullName;
});

AuthorSchema.virtual('url').get(function () {
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual('date_of_birth_formatted').get(function () {
  let dobFormatted = '?';
  if (this.date_of_birth)
    dobFormatted = DateTime.fromJSDate(this.date_of_birth).toLocaleString(
      DateTime.DATE_MED,
    );
  return dobFormatted;
});

AuthorSchema.virtual('date_of_death_formatted').get(function () {
  let dodFormatted = '?';
  if (this.date_of_death)
    dodFormatted = DateTime.fromJSDate(this.date_of_death).toLocaleString(
      DateTime.DATE_MED,
    );
  return dodFormatted;
});

AuthorSchema.virtual('date_of_birth_iso').get(function () {
  let dobIso = '';
  if (this.date_of_birth)
    dobIso = DateTime.fromJSDate(this.date_of_birth).toISODate();
  return dobIso; 
})

AuthorSchema.virtual('date_of_death_iso').get(function () {
  let dodIso = '';
  if (this.date_of_death)
    dodIso = DateTime.fromJSDate(this.date_of_death).toISODate();
  return dodIso; 
})

module.exports = mongoose.model('Author', AuthorSchema);
