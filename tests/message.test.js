import { Message } from '../src/message'
import { Buffers } from '../src/buffers'

const protocol = new Message()
describe('Message tool test', () => {
  let writeData, responseData
  beforeAll(async () => {
  })

  afterAll(async () => {
  })

  it('Message property test ', async () => {
    expect(protocol.version).toBe('v1')
    expect(protocol.nethash).toBe('0ab796cd')
    expect(protocol.serial).toBe(0)
  })

  it('checksum method test ', async () => {
    const result = Message.checksum(Buffer.from('hello'))
    expect(result.toString('hex')).toBe('5d41402abc4b2a76b9719d911017c592')
  })

  it('getDataType method test ', async () => {
    const result1 = Message.getDataType(Buffer.from('hello'))
    expect(result1).toBe(Message.types.BINARY)
    const result2 = Message.getDataType({ a: 1, b: 2 })
    expect(result2).toBe(Message.types.JSON)
    const result3 = Message.getDataType('hello')
    expect(result3).toBe(Message.types.TEXT)
    const result4 = Message.getDataType([{ a: 1 }, { a: 2 }])
    expect(result4).toBe(Message.types.JSON)
    const result5 = Message.getDataType([[1, 2], [3, 4]])
    expect(result5).toBe(Message.types.JSON)
  })

  it('_findHeader method test ', async () => {
    const bufs = new Buffers()
    bufs.push(Buffer.from('hello'))
    const result1 = protocol._findHeader(bufs)
    expect(result1).toBe(false)
    expect(bufs.length).toBe(5)
  })

  // it('_findHeader method test: bufs.lenghth >= minPacketSize ', async () => {
  //   const bufs = new Buffers()
  //   bufs.push(Buffer.from('hellohellohellohello'))
  //   const result1 = protocol._findHeader(bufs)
  //   expect(result1).toBe(false)
  //   expect(bufs.length).toBe(19)
  //   bufs.push(Buffer.from(protocol._header + 'hello world'))
  //   const result2 = protocol._findHeader(bufs)
  //   expect(result2).toBe(false)
  //   expect(bufs.length).toBe(protocol._header_size)
  // })

  it('getDataType method test ', async () => {
    const result1 = Message.getDataType(Buffer.from('hello'))
    expect(result1).toBe(Message.types.BINARY)
    const result2 = Message.getDataType({ a: 1, b: 2 })
    expect(result2).toBe(Message.types.JSON)
    const result3 = Message.getDataType('hello')
    expect(result3).toBe(Message.types.TEXT)
    const result4 = Message.getDataType([{ a: 1 }, { a: 2 }])
    expect(result4).toBe(Message.types.JSON)
    const result5 = Message.getDataType([[1, 2], [3, 4]])
    expect(result5).toBe(Message.types.JSON)
  })

  it('packet method test', () => {
    writeData = protocol.packet(Message.commands.GET, 'hello')
    expect(protocol.serial).toBe(1)
    expect(writeData.toString('hex')).toBe('64646e3a7032702f2f76314030616237393663645b0000000000150056007b2274797065223a302c22636865636b73756d223a223564343134303261626334623261373662393731396439313130313763353932227d68656c6c6f')
    responseData = protocol.packet(Message.commands.RESPONSE, 'world', null, 5)
    expect(protocol.serial).toBe(1)
    expect(responseData.toString('hex')).toBe('64646e3a7032702f2f76314030616237393663645b0000000500190056007b2274797065223a302c22636865636b73756d223a223764373933303337613037363031383635373462303238326632663433356537227d776f726c64')
  })

  it('unpack method test', () => {
    const dataBuffer1 = new Buffers()
    dataBuffer1.push(writeData)
    const unpackWriteMsg = protocol.unpack(dataBuffer1)
    expect(unpackWriteMsg.size).toBe(5)
    expect(unpackWriteMsg.serial).toBe(0)
    expect(unpackWriteMsg.cmd).toBe(Message.commands.GET)
    expect(unpackWriteMsg.data.toString()).toBe('hello')
    const dataBuffer2 = new Buffers()
    dataBuffer2.push(responseData)
    const unpackResponseMsg = protocol.unpack(dataBuffer2)
    expect(unpackResponseMsg.size).toBe(5)
    expect(unpackResponseMsg.serial).toBe(5)
    expect(unpackResponseMsg.cmd).toBe(Message.commands.RESPONSE)
    expect(unpackResponseMsg.data.toString()).toBe('world')
  })
  it('uniray packet test', () => {
    const version = protocol.packet(Message.commands.VERSION)
    expect(protocol.serial).toBe(2)
    expect(version.length).toBe(protocol.minPacketSize)
    const dataBuffer = new Buffers()
    dataBuffer.push(version)
    const unpackVersionMsg = protocol.unpack(dataBuffer)
    expect(unpackVersionMsg.size).toBe(undefined)
    expect(unpackVersionMsg.cmd).toBe(Message.commands.VERSION)
    expect(unpackVersionMsg.serial).toBe(1)
  })
  it('non uniray packet test', () => {
    const packet = protocol.packet(Message.commands.GET, 'hello')
    expect(protocol.serial).toBe(3)
    expect(packet.length).toBe(91)
    const dataBuffer = new Buffers()
    dataBuffer.push(packet)
    const unpackPacketMsg = protocol.unpack(dataBuffer)
    expect(unpackPacketMsg.size).toBe(5)
    expect(unpackPacketMsg.cmd).toBe(Message.commands.GET)
    expect(unpackPacketMsg.serial).toBe(2)
    expect(unpackPacketMsg.data.toString()).toBe('hello')
    expect(unpackPacketMsg.meta.type).toBe(0)
  })
})
