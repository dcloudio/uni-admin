<template>
	<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
		<uni-tr>
			<template v-for="(mapper, index) in filedsMap">
				<uni-th v-if="mapper.title" :key="index" align="center">{{mapper.title}}</uni-th>
			</template>
		</uni-tr>
		<uni-tr v-for="(item ,i) in data" :key="i">
			<template v-for="(mapper, index) in filedsMap">
				<uni-td v-if="mapper.title" :key="index" align="center">
					{{item[mapper.field] !== undefined ? item[mapper.field] : '-'}}
				</uni-td>
			</template>
		</uni-tr>
	</uni-table>
</template>

<script>
	import {
		format
	} from '@/js_sdk/uni-stat/util.js'
	export default {
		name: "uni-stat-table",
		data() {
			return {

			};
		},
		props: {
			data: {
				type: Array,
				default: () => {
					return []
				}
			},
			filedsMap: {
				type: Array,
				default: () => {
					return []
				}
			},
			loading: {
				type: Boolean,
				default: false
			}
		}
	}
</script>

<style>

</style>
