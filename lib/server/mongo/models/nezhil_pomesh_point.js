import mongoose from 'mongoose';

const NezhilPomeshPointSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Feature'],
    default: 'Feature'
  },
  properties: {
    OBJECTID: {
      type: String,
      index: true
    },
    Наименование: String,
    Адрес: String,
    этажность: String,
    Год_ввода_в_эксплуатацию: String,
    oks_ID: String,
    Общ_пл: String,
    Количество: String,
    Реквизиты_свидетельства: String,
    Помещение: String,
    Признак: String,
    Первонач_стоим: String,
    Остаточ_стоимость: String,
    Подраздел_в_реестре: String,
    Дом_код: String,
    Юрлицо: String,
    oks_ID_offset: String,
  },
  geometry: {
    type: String,
    coordinates: Array
  }
});

export default mongoose.model('NezhilPomeshPoint', NezhilPomeshPointSchema);
