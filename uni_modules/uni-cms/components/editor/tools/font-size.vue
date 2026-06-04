<template>
	<toolbarTool type="dropdown" @change="change" :items="items" default-val="17px" :active="active" :disabled="disabled" :tooltip="{content: '字号'}" popup-style="width: 140px;">
		<view>{{ activeText }}<text style="font-size: 13px;">px</text></view>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "tool-font-size",
	emits: ['change'],
	props: {
		active: [Boolean, Number, String],
    disabled: Boolean
	},
	data () {
		return {
			items: [
				{
					text: '12',
					value: '12px',
					active: false,
					style: {
						fontSize: '12px'
					}
				},{
					text: '14',
					value: '14px',
					active: false,
					style: {
						fontSize: '14px'
					}
				},{
					text: '15',
					value: '15px',
					active: false,
					style: {
						fontSize: '15px'
					}
				},{
					text: '16',
					value: '16px',
					active: false,
					style: {
						fontSize: '16px'
					}
				},{
					text: '17',
					value: '17px',
					active: false,
					style: {
						fontSize: '17px'
					}
				},{
          text: '18',
          value: '18px',
          active: false,
          style: {
            fontSize: '18px'
          }
        },{
          text: '19',
          value: '19px',
          active: false,
          style: {
            fontSize: '19px'
          }
        },{
          text: '20',
          value: '20px',
          active: false,
          style: {
            fontSize: '20px'
          }
        },{
          text: '22',
          value: '22px',
          active: false,
          style: {
            fontSize: '22px'
          }
        },{
          text: '24',
          value: '24px',
          active: false,
          style: {
            fontSize: '24px'
          }
        }
			]
		}
	},
	watch: {
		active (newValue) {
			const index = this.items.findIndex(item => item.value === newValue)
			this.items.map((item, mIndex) => {
				this.items[mIndex].active = (index === mIndex)
			})
		}
	},
	computed: {
		activeText () {
			const item = this.items.find(item => item.active)

			if (item) return item.text

			return this.items[0].text
		}
	},
	components: {
		ToolbarTool
	},
	methods: {
		change (e) {
			this.$emit('change', {
				type: 'font-size',
				value: e.value
			})
		}
	}
}
</script>

<style scoped>
// #ifdef H5
@import '@/uni_modules/uni-cms/common/style/editor-icon.css';
// #endif
</style>
