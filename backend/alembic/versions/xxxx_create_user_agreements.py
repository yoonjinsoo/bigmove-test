"""create user agreements table

Revision ID: xxxx
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'user_agreements',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id')),
        sa.Column('terms', sa.Boolean, nullable=False),
        sa.Column('privacy', sa.Boolean, nullable=False),
        sa.Column('privacy_third_party', sa.Boolean, nullable=False),
        sa.Column('marketing', sa.Boolean, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now())
    )
    
    # 명시적 제약조건
    op.create_unique_constraint('uq_user_agreements_user_id', 'user_agreements', ['user_id'])

def downgrade():
    op.drop_table('user_agreements') 