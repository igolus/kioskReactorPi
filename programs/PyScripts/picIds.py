from ids_peak_ipl import ids_peak_ipl

index = 0

# while m_running:
try:
    # Get buffer from device's DataStream. Wait 5000 ms. The buffer is automatically locked until it is queued again.
    buffer = m_data_stream.WaitForFinishedBuffer(5000)
    # 
    # Create IDS peak IPL image from buffer
    image = ids_peak_ipl.Image.CreateFromSizeAndBuffer(
        buffer.PixelFormat(),
        buffer.BasePtr(),
        buffer.Size(),
        buffer.Width(),
        buffer.Height()
    )

    # Create IDS peak IPL image for debayering and convert it to RGBa8 format
    image_processed = image.ConvertTo(ids_peak_ipl.PixelFormatName_BGRa8, ids_peak_ipl.ConversionMode_Fast)

    # Queue buffer again
    # m_data_stream.QueueBuffer(buffer)

    file = "c:/entwicklung/test_" + index + ".jpg"
    ids_peak_ipl.ImageWriter.Write(file, image_processed)
    index = index + 1
except Exception as e:
# ...
str_error = str(e)