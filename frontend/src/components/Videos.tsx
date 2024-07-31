import React, { MutableRefObject } from "react";

const Videos = ({
  localVideo,
  remoteVideo,
}: {
  localVideo: MutableRefObject<HTMLVideoElement | undefined>;
  remoteVideo: MutableRefObject<HTMLVideoElement | undefined>;
}) => {
  return (
    <div>
      <div>
        <video ref={localVideo} />
      </div>
      <div>
        <video ref={remoteVideo} />
      </div>
    </div>
  );
};

export default Videos;
