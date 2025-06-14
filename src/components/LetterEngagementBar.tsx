
import React, { useState } from "react";
import EmojiReactionBar from "./EmojiReactionBar";
import LikeButton from "./LikeButton";
import CommentButton from "./CommentButton";
import ShareButton from "./ShareButton";
import CommentSheet from "./CommentSheet";

type Props = {
  letterId: string;
  text: string;
  tag: string | null;
};

const LetterEngagementBar: React.FC<Props> = ({ letterId, text, tag }) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <EmojiReactionBar letterId={letterId} />
      <div className="flex items-center justify-between mt-1 text-sm">
        <div className="flex gap-3">
          <LikeButton letterId={letterId} />
          <CommentButton letterId={letterId} onShowComments={() => setShowComments(true)} />
        </div>
        <ShareButton letterId={letterId} text={text} tag={tag} />
      </div>
      <CommentSheet open={showComments} onOpenChange={setShowComments} letterId={letterId} />
    </div>
  );
};

export default LetterEngagementBar;
