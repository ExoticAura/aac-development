from sqlalchemy import String, Integer, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base

class Pack(Base):
    __tablename__ = "packs"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)  # e.g. pack_default_help
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=True)
    subject: Mapped[str] = mapped_column(String(60), nullable=True)
    grade: Mapped[str] = mapped_column(String(20), nullable=True)
    color: Mapped[str] = mapped_column(String(20), nullable=True)  # e.g. "#FFE2B8"
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    vocab_items = relationship("VocabItem", back_populates="pack", cascade="all, delete")

class VocabItem(Base):
    __tablename__ = "vocab_items"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)  # vocab_xxxxx
    pack_id: Mapped[str] = mapped_column(String(60), ForeignKey("packs.id"), nullable=False)

    label: Mapped[str] = mapped_column(String(80), nullable=False)
    say: Mapped[str] = mapped_column(Text, nullable=True)
    icon: Mapped[str] = mapped_column(String(200), nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    pack = relationship("Pack", back_populates="vocab_items")
