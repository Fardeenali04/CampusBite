
from pydantic import BaseModel, Field


class InsightRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)


class InsightResponse(BaseModel):
    answer: str
    orders_analyzed: int
