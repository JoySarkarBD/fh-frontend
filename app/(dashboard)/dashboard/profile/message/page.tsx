import Image from "next/image";

export default function UserMessagePage() {
  return (
    <div className='flex flex-col max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md'>
      {/* Header */}
      <h1 className='text-2xl font-semibold mb-6'>Message</h1>

      <div className='flex space-x-6'>
        {/* Profile Section */}
        <div className='shrink-0'>
          <Image
            src='/path/to/profile-image.jpg'
            alt='User Profile'
            width={60}
            height={60}
            className='rounded-full border-2 border-gray-300'
          />
        </div>

        {/* Chat Messages Section */}
        <div className='flex-1'>
          <div className='space-y-4'>
            <div className='flex space-x-2'>
              <p className='font-semibold'>Elmer Laverty</p>
              <span className='text-green-500'>Online</span>
            </div>
            <div className='space-y-2'>
              <div className='flex items-start space-x-2'>
                <div className='bg-blue-500 text-white p-2 rounded-lg max-w-xs'>
                  omg, this is amazing
                </div>
                <div className='text-gray-400 text-xs'>30m</div>
              </div>
              <div className='flex items-start space-x-2'>
                <div className='bg-blue-500 text-white p-2 rounded-lg max-w-xs'>
                  perfect! ✅
                </div>
                <div className='text-gray-400 text-xs'>30m</div>
              </div>
              <div className='flex items-start space-x-2'>
                <div className='bg-blue-500 text-white p-2 rounded-lg max-w-xs'>
                  Wow, this is really epic
                </div>
                <div className='text-gray-400 text-xs'>30m</div>
              </div>
              <div className='flex items-start space-x-2'>
                <div className='bg-blue-500 text-white p-2 rounded-lg max-w-xs'>
                  Wow, Khalid The Coder is really epic
                </div>
                <div className='text-gray-400 text-xs'>30m</div>
              </div>
            </div>
            {/* User Input Area */}
            <div className='flex items-center space-x-3 mt-4'>
              <input
                type='text'
                placeholder='How are you?'
                className='flex-1 px-4 py-2 border rounded-lg'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
