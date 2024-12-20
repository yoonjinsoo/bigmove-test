"""create user agreements table

Revision ID: 9088013f6004
Revises: 0e844d7241b4
Create Date: 2024-12-21 06:37:12.385030

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9088013f6004'
down_revision: Union[str, None] = '0e844d7241b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
