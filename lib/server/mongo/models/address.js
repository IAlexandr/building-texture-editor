import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  RegisterNo: {
    type: String,
    required: false,
    default: 'empty'
  },
  ID: {
    type: String,
    required: false,
    default: 'empty'
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
