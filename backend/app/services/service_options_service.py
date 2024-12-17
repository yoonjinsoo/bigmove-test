from ..schemas.service_options import ServiceOption, ServiceOptionsResponse

class ServiceOptionsService:
    def get_all_options(self) -> ServiceOptionsResponse:
        floor_options = [
            ServiceOption(
                id=f"floor-{i}",
                type="floor",
                label=f"{i}층",
                description=f"{i}층 배송",
                fee=i * 10000 if i > 1 else 0,
                available=True
            ) for i in range(1, 6)
        ]

        ladder_options = [
            ServiceOption(
                id="ladder-normal",
                type="ladder",
                label="사다리차 (1~6층)",
                description="1층~6층 사다리차 서비스",
                fee=70000,
                available=True
            ),
            ServiceOption(
                id="ladder-high",
                type="ladder",
                label="고층 사다리차 (7층 이상)",
                description="7층 이상 고층 사다리차 서비스 (가격 협의 필요)",
                fee=None,
                available=True
            )
        ]

        special_vehicle_options = [
            ServiceOption(
                id="special-sky",
                type="special",
                label="스카이차량",
                description="사다리차 이용이 어려운 경우 (실비청구)",
                fee=None,
                available=True
            ),
            ServiceOption(
                id="special-crane",
                type="special",
                label="크레인",
                description="대형 화물 또는 특수 상황 (실비청구)",
                fee=None,
                available=True
            )
        ]

        return ServiceOptionsResponse(
            floor_options=floor_options,
            ladder_options=ladder_options,
            special_vehicle_options=special_vehicle_options
        ) 