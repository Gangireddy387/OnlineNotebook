<template>
  <div class="emoji-picker bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-gray-900">Choose an emoji</h3>
      <button 
        @click="$emit('close')"
        class="p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <div class="max-h-48 overflow-y-auto">
      <div class="grid grid-cols-8 gap-1">
        <button 
          v-for="emoji in emojis" 
          :key="emoji"
          @click="selectEmoji(emoji)"
          class="p-2 text-lg hover:bg-gray-100 rounded transition-colors"
          :title="emoji"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmojiPicker',
  data() {
    return {
      emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
        '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
        '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
        '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
        '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
        '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
        '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
        '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
        '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
        '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
        '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
        '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
        '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
        '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👶',
        '👧', '🧒', '👦', '👩', '🧑', '👨', '👱‍♀️', '👱‍♂️',
        '🧔', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳‍♂️', '🧕',
        '👮‍♀️', '👮‍♂️', '👷‍♀️', '👷‍♂️', '💂‍♀️', '💂‍♂️', '🕵️‍♀️', '🕵️‍♂️',
        '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓',
        '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭', '👨‍🏭', '👩‍💻', '👨‍💻',
        '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨',
        '👩‍🚒', '👨‍🚒', '👩‍✈️', '👨‍✈️', '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️',
        '👰', '🤵', '👸', '🤴', '🦸‍♀️', '🦸‍♂️', '🦹‍♀️', '🦹‍♂️',
        '🤶', '🎅', '🧙‍♀️', '🧙‍♂️', '🧝‍♀️', '🧝‍♂️', '🧛‍♀️', '🧛‍♂️',
        '🧟‍♀️', '🧟‍♂️', '🧞‍♀️', '🧞‍♂️', '🧜‍♀️', '🧜‍♂️', '🧚‍♀️', '🧚‍♂️',
        '👼', '🤰', '🤱', '🙇‍♀️', '🙇‍♂️', '💁‍♀️', '💁‍♂️', '🙅‍♀️',
        '🙅‍♂️', '🙆‍♀️', '🙆‍♂️', '🙋‍♀️', '🙋‍♂️', '🧏‍♀️', '🧏‍♂️', '🤦‍♀️',
        '🤦‍♂️', '🤷‍♀️', '🤷‍♂️', '🙎‍♀️', '🙎‍♂️', '🙍‍♀️', '🙍‍♂️', '💇‍♀️',
        '💇‍♂️', '💆‍♀️', '💆‍♂️', '🧖‍♀️', '🧖‍♂️', '💅', '🤳', '💃',
        '🕺', '👯‍♀️', '👯‍♂️', '🕴', '👩‍🦽', '👨‍🦽', '👩‍🦼', '👨‍🦼',
        '🚶‍♀️', '🚶‍♂️', '👩‍🦯', '👨‍🦯', '🧎‍♀️', '🧎‍♂️', '🏃‍♀️', '🏃‍♂️',
        '🧍‍♀️', '🧍‍♂️', '👫', '👬', '👭', '💑', '👩‍❤️‍👩', '👨‍❤️‍👨',
        '💏', '👩‍❤️‍💋‍👩', '👨‍❤️‍💋‍👨', '👪', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧',
        '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦',
        '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '👨‍👦', '👨‍👦‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👧‍👧', '👩‍👦',
        '👩‍👦‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👧‍👧', '🗣', '👤', '👥', '👣'
      ]
    };
  },
  methods: {
    selectEmoji(emoji) {
      this.$emit('emoji-selected', emoji);
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 50;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
