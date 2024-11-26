export class MongoTransformer {
  static toJson(document: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...rest } = document.toObject();
    return rest;
  }
}
