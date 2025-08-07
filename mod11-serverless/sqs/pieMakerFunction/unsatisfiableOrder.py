class UnsatisfiableOrderException(Exception):
    def __init__(self, msg="This order can't be satisfied here"):
        self.message = msg
        super().__init__(self.message)
