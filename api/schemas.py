from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ClientSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    location: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime


class TenderStatusHistorySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status: str
    transition_at: datetime
    reason: Optional[str] = None


class CPVCodeSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: str
    is_main: bool
    label: Optional[str] = None


class TenderLotSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    lot_number: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    total_value: Optional[float] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None


class TenderCriteriaSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    type: Optional[str] = None
    weight: Optional[str] = None
    description: Optional[str] = None


class TenderAwardSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    awarded_to_name: str
    awarded_to_country: Optional[str] = None
    award_value: Optional[float] = None
    award_date: Optional[datetime] = None
    contract_id: Optional[str] = None


class TenderAttachmentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: Optional[str] = None
    url: str
    mime_type: Optional[str] = None
    extracted_text: Optional[str] = None


class TenderMetadataSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    buyer_name: Optional[str] = None
    buyer_country: Optional[str] = None
    tender_type: Optional[str] = None
    procedure_type: Optional[str] = None
    tender_language: Optional[str] = None
    crawled_at: datetime
    source_url: str
    checksum: str
    version: int = 1
    portal_specific_data: Optional[dict] = None


class TenderSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    external_id: str
    source_system: str
    caller: Optional[str] = None
    customer: Optional[str] = None

    # Classification
    notice_type: Optional[str] = None
    tender_type: Optional[str] = None
    procedure_type: Optional[str] = None
    legal_basis: Optional[str] = None

    # Buyer Details
    buyer_type: Optional[str] = None
    buyer_activity: Optional[str] = None

    # Contractual Details
    is_framework: bool = False
    contract_model: Optional[str] = None
    winners_summary: Optional[str] = None

    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

    address_zip: Optional[str] = None
    address_city: Optional[str] = None
    address_country: Optional[str] = None
    nuts_codes: Optional[List[str]] = None

    title: str
    description: Optional[str] = None
    document_text: Optional[str] = None
    document_links: Optional[dict] = None
    current_status: str
    total_value: Optional[float] = None
    currency: Optional[str] = None
    client_id: Optional[UUID] = None

    published_at: Optional[datetime] = None
    deadline_at: Optional[datetime] = None
    contract_start_at: Optional[datetime] = None
    contract_end_at: Optional[datetime] = None
    duration_value: Optional[int] = None
    duration_unit: Optional[str] = None

    crawled_at: datetime
    updated_at: datetime

    metadata_info: Optional[TenderMetadataSchema] = None
    client: Optional[ClientSchema] = None
    cpv_codes: List[CPVCodeSchema] = []
    lots: List[TenderLotSchema] = []
    criteria: List[TenderCriteriaSchema] = []
    awards: List[TenderAwardSchema] = []
    attachments: List[TenderAttachmentSchema] = []
    status_history: List[TenderStatusHistorySchema] = []


class JobOfferSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    external_id: str
    source_system: str
    title: str
    employer: str
    location: Optional[str] = None
    salary_group: Optional[str] = None
    description: Optional[str] = None
    link: str
    is_public: Optional[bool] = True
    category: Optional[str] = "PUBLIC_SECTOR"
    deadline_at: Optional[datetime] = None
    crawled_at: datetime
    updated_at: datetime


class TenderWinningNoticeSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    external_id: str
    source_system: str
    title: str
    contracting_authority: str
    cpv_code: Optional[str] = None
    location_nuts: Optional[str] = None
    winner_name: Optional[str] = None
    winner_address: Optional[str] = None
    winner_id: Optional[str] = None
    contract_value: Optional[float] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    link: str
    is_public: Optional[bool] = True
    publication_date: Optional[datetime] = None
    crawled_at: datetime
    updated_at: datetime
