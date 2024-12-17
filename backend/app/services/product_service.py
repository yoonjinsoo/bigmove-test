from sqlalchemy.orm import Session
from app.models.product import Category, Product, ProductVariant

class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_categories(self):
        return self.db.query(Category).all()

    def get_products(self, category_id: int):
        return self.db.query(Product).filter(Product.category_id == category_id).all()

    def get_variants(self, product_id: int):
        return self.db.query(ProductVariant).filter(ProductVariant.product_id == product_id).all()
