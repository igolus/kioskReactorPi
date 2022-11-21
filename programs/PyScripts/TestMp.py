import time
from multiprocessing import Process, Manager, Value


def foo(data, name=''):
    print(type(data), data.value, name)

    data.value += 1
    print('foo = {0}'.format(data.value))

def foo2(data, name=''):
    print(type(data), data.value, name)
    data.value += 1
    print('foo2 = {0}'.format(data.value))

if __name__ == "__main__":
    manager = Manager()
    #x = manager.Value('i', 0)
    y = Value('i', 0)

    Process(target=foo, args=(y, 'y')).start()
    Process(target=foo2, args=(y, 'y')).start()


    print('y = {0}'.format(y.value))

    time.sleep(5.0)
    print('After waiting: ')
    print('y = {0}'.format(y.value))
