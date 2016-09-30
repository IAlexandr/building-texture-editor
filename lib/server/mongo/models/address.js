import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  RegisterNo: {
    type: String,
    required: true,
  },
  ID: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    enum: ['необработаное', 'обработаное', 'недостаточно фотографий', 'другое'],
    default: 'другое'
  },
  comment: {
    type: String,
    required: false
  },
});

export default mongoose.model('Address', AddressSchema);
