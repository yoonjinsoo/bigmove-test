from sqlalchemy.orm import Session
from app.models.item import Item
from app.schemas.item import ItemCreate

def create_item(db: Session, item: ItemCreate):
    db_item = Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_items_by_category(db: Session, category_id: str):
    return db.query(Item).filter(Item.categoryId == category_id).all() 