from collections.abc import Iterable
from typing import Any

from fava.beans.abc import Position

class Inventory(dict[Any, Position]):
    def __init__(self, positions: Iterable[Position] | None = ...) -> None: ...
    def is_empty(self) -> bool: ...
    def __neg__(self) -> Inventory: ...
    def reduce(self, reducer: Any, *args: Any) -> Inventory: ...
    def add_position(self, position: Position) -> None: ...
